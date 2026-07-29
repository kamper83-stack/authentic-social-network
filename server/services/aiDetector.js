const exifr = require('exifr');

/**
 * Known AI signature phrases & buzzwords
 */
const AI_BUZZWORDS = [
  'as an ai',
  'language model',
  'in conclusion',
  'in summary',
  'delve into',
  'delving into',
  'testament to',
  'unlocking the potential',
  'seamlessly blend',
  'it is important to remember',
  'it\'s important to note',
  'vital role',
  'pivotal role',
  'tapestry of',
  'rich tapestry',
  'beacon of',
  'paradigm shift',
  'ever-evolving landscape',
  'fostering a',
  'delve deeper',
  'revolutionize the way',
  'delicate balance'
];

/**
 * Analyze text for AI generation markers vs authentic human writing
 */
function analyzeText(text) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return { score: 0, flags: [] };
  }

  const normalized = text.toLowerCase();
  const flags = [];
  let riskPoints = 0;

  // 1. Signature phrase match
  let buzzwordMatches = 0;
  AI_BUZZWORDS.forEach((phrase) => {
    if (normalized.includes(phrase)) {
      buzzwordMatches++;
      flags.push(`Matched signature AI phrase: "${phrase}"`);
    }
  });

  if (buzzwordMatches > 0) {
    riskPoints += buzzwordMatches * 35;
  }

  // 2. Sentence Length Uniformity (Low variance / burstiness is an AI marker)
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length >= 3) {
    const lengths = sentences.map((s) => s.split(/\s+/).length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance =
      lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) /
      lengths.length;
    const stdDev = Math.sqrt(variance);

    // AI output often has extremely low standard deviation in sentence length (e.g. standard 15-20 word sentences)
    if (stdDev < 2.5 && avg > 12) {
      riskPoints += 25;
      flags.push('Low sentence variance (Unusually uniform sentence structure)');
    } else if (stdDev > 5) {
      // High burstiness is characteristic of human writing
      riskPoints = Math.max(0, riskPoints - 10);
    }
  }

  // 3. Perfect Punctuation & Formatting vs Casual Human Features
  const hasHumanTyposOrSlang =
    /\b(gonna|wanna|gotta|haha|lol|tbh|imo|brb|y'all|omg|smh|yeah|cuz|sup)\b/i.test(
      text
    ) || /!{2,}|\?{2,}/.test(text);

  if (hasHumanTyposOrSlang) {
    riskPoints = Math.max(0, riskPoints - 20);
  }

  // 4. Overly balanced transition words density (AI loves "Furthermore", "Moreover", "However", "In addition")
  const transitionCount = (
    normalized.match(
      /\b(furthermore|moreover|additionally|consequently|nonetheless|nevertheless|in conclusion)\b/g
    ) || []
  ).length;

  if (transitionCount >= 2) {
    riskPoints += transitionCount * 15;
    flags.push(`High density of formal transitional markers (${transitionCount})`);
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(riskPoints)));
  return { score: finalScore, flags };
}

/**
 * Analyze image buffer / file for EXIF metadata & AI generation tags
 */
async function analyzeImageMetadata(imageBuffer) {
  if (!imageBuffer) {
    return { score: 0, flags: [], cameraInfo: null };
  }

  const flags = [];
  let riskPoints = 0;
  let cameraInfo = null;

  try {
    const parsedExif = await exifr.parse(imageBuffer, {
      tiff: true,
      xmp: true,
      icc: true,
      jfif: true,
    });

    if (parsedExif) {
      const software = String(parsedExif.Software || parsedExif.creator || '').toLowerCase();
      const comment = String(parsedExif.UserComment || parsedExif.ImageDescription || '').toLowerCase();

      // Check AI generator software signatures
      const aiKeywords = [
        'midjourney',
        'dall-e',
        'stable diffusion',
        'comfyui',
        'automatic1111',
        'adobe firefly',
        'novelai',
        'generative fill'
      ];

      for (const keyword of aiKeywords) {
        if (software.includes(keyword) || comment.includes(keyword)) {
          riskPoints += 85;
          flags.push(`AI Generator signature detected in image metadata: "${keyword}"`);
          break;
        }
      }

      // Check authentic camera attributes
      if (parsedExif.Make || parsedExif.Model) {
        cameraInfo = `${parsedExif.Make || ''} ${parsedExif.Model || ''}`.trim();
        riskPoints = Math.max(0, riskPoints - 25); // Authentic camera metadata reduces AI risk
      }

      if (parsedExif.FNumber || parsedExif.ExposureTime || parsedExif.ISO) {
        riskPoints = Math.max(0, riskPoints - 15);
      }
    } else {
      // Stripped metadata is common on social media, so mild score adjustment
      flags.push('No EXIF camera metadata found (Standard for web uploads)');
    }
  } catch (err) {
    // Exifr failed or unhandled image type
    flags.push('Metadata unreadable or clean web format');
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(riskPoints)));
  return { score: finalScore, flags, cameraInfo };
}

/**
 * Main AI Content Inspection API
 */
async function inspectContent({ text, imageBuffer }) {
  const textAnalysis = analyzeText(text);
  const imageAnalysis = await analyzeImageMetadata(imageBuffer);

  let combinedScore = 0;
  if (text && imageBuffer) {
    combinedScore = Math.round(textAnalysis.score * 0.5 + imageAnalysis.score * 0.5);
  } else if (text) {
    combinedScore = textAnalysis.score;
  } else if (imageBuffer) {
    combinedScore = imageAnalysis.score;
  }

  const isHumanVerified = combinedScore < 25;
  const allFlags = [...textAnalysis.flags, ...imageAnalysis.flags];

  let statusLabel = '100% Human Verified';
  let badgeColor = 'emerald';

  if (combinedScore >= 60) {
    statusLabel = 'High AI Probability Risk';
    badgeColor = 'red';
  } else if (combinedScore >= 25) {
    statusLabel = 'Under Community Review';
    badgeColor = 'amber';
  }

  return {
    aiProbability: combinedScore,
    textRiskScore: textAnalysis.score,
    metadataRiskScore: imageAnalysis.score,
    isHumanVerified,
    statusLabel,
    badgeColor,
    cameraInfo: imageAnalysis.cameraInfo,
    flags: allFlags
  };
}

module.exports = {
  analyzeText,
  analyzeImageMetadata,
  inspectContent
};
