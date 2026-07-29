const assert = require('assert');
const { analyzeText, inspectContent } = require('../services/aiDetector');

async function runTests() {
  console.log('🧪 Running AI Detector Unit Tests...\n');

  // Test 1: Authentic Human Text
  const humanText = "Hey y'all! Spent 3 hours painting this sunset by the harbor today. Messed up the colors at first lol but fixed it with some titanium white.";
  const humanRes = analyzeText(humanText);
  console.log('Human Text Result:', humanRes);
  assert.strictEqual(humanRes.score < 20, true, 'Human text should have low AI risk score');

  // Test 2: AI Signature Buzzwords Text
  const aiText = "As an AI language model, it is important to remember that this project serves as a testament to unlocking the potential in an ever-evolving landscape.";
  const aiRes = analyzeText(aiText);
  console.log('AI Text Result:', aiRes);
  assert.strictEqual(aiRes.score >= 60, true, 'AI signature text should trigger high AI risk score');

  // Test 3: Full Content Inspection
  const inspection = await inspectContent({ text: humanText });
  console.log('Full Inspection Result:', inspection);
  assert.strictEqual(inspection.isHumanVerified, true, 'Human content should be verified');
  assert.strictEqual(inspection.badgeColor, 'emerald');

  console.log('\n✅ All AI Detector tests passed successfully!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
