const Person = require('../models/Person');
const stringSimilarity = require('string-similarity');
const { cloudinary } = require('../config/cloudinary');
const streamifier = require('streamifier');

const getPeople = async (req, res) => {
  try {
    const people = await Person.find({}).sort({ createdAt: -1 });
    res.json(people);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const searchPeople = async (req, res) => {
  const { q } = req.query;
  try {
    if (!q) return res.status(400).json({ message: 'Query is required' });
    
    // Get all published people to match against
    const people = await Person.find({ status: 'published' }).select('name aliases slug theme');
    
    if (people.length === 0) return res.status(404).json({ message: 'No match found' });

    // Build array of all searchable strings and map back to person
    let matchTargets = [];
    let targetToPerson = {};
    
    people.forEach(p => {
      const mainName = p.name.toLowerCase();
      matchTargets.push(mainName);
      targetToPerson[mainName] = p;
      
      if (p.aliases && p.aliases.length > 0) {
        p.aliases.forEach(alias => {
          const lowerAlias = alias.toLowerCase();
          matchTargets.push(lowerAlias);
          targetToPerson[lowerAlias] = p;
        });
      }
    });

    const matches = stringSimilarity.findBestMatch(q.toLowerCase(), matchTargets);
    const bestMatch = matches.bestMatch;
    
    // Match if >= 70% similar
    if (bestMatch.rating >= 0.7) {
      return res.json(targetToPerson[bestMatch.target]);
    }
    
    return res.status(404).json({ message: 'No match found' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPersonBySlug = async (req, res) => {
  try {
    const person = await Person.findOne({ slug: req.params.slug });
    if (!person) {
      return res.status(404).json({ message: 'Person not found' });
    }
    // We do not check if draft here, because the preview mode might need it.
    // If it's a public request, they wouldn't know the draft slug anyway.
    // Or we could check a `?preview=true` query param, but it requires no auth to view.
    res.json(person);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const generateSlug = async (name) => {
  let baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  let slug = baseSlug;
  let count = 1;
  while (await Person.findOne({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }
  return slug;
};

const uploadAudioToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'message_audio' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const createPerson = async (req, res) => {
  try {
    const { name, aliases, relationship, message, theme, status, songStartTime, songEndTime } = req.body;
    let songUrl = '';
    let songName = '';
    let songSize = 0;
    
    if (req.file) {
      const result = await uploadAudioToCloudinary(req.file.buffer);
      songUrl = result.secure_url;
      songName = req.file.originalname;
      songSize = req.file.size;
    }

    const slug = await generateSlug(name);
    
    const parsedAliases = aliases ? aliases.split(',').map(a => a.trim()).filter(a => a) : [];

    const person = await Person.create({
      name,
      aliases: parsedAliases,
      slug,
      relationship,
      message,
      theme,
      status,
      songUrl,
      songName,
      songSize,
      songStartTime: songStartTime ? Number(songStartTime) : 0,
      songEndTime: songEndTime ? Number(songEndTime) : 0,
    });
    
    res.status(201).json(person);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updatePerson = async (req, res) => {
  try {
    const { name, aliases, relationship, message, theme, status, songStartTime, songEndTime } = req.body;
    const parsedAliases = aliases ? aliases.split(',').map(a => a.trim()).filter(a => a) : [];
    
    let updateData = { 
      name, aliases: parsedAliases, relationship, message, theme, status,
      songStartTime: songStartTime ? Number(songStartTime) : 0,
      songEndTime: songEndTime ? Number(songEndTime) : 0,
    };

    if (req.file) {
      const result = await uploadAudioToCloudinary(req.file.buffer);
      updateData.songUrl = result.secure_url;
      updateData.songName = req.file.originalname;
      updateData.songSize = req.file.size;
    }

    const person = await Person.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(person);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const deletePerson = async (req, res) => {
  try {
    await Person.findByIdAndDelete(req.params.id);
    res.json({ message: 'Person removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const bulkDeletePeople = async (req, res) => {
  try {
    const { ids } = req.body;
    await Person.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'People removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getPeople,
  searchPeople,
  getPersonBySlug,
  createPerson,
  updatePerson,
  deletePerson,
  bulkDeletePeople
};
