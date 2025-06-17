const fs = require('fs');

async function testSpeechAPIWithRealFile() {
  try {
    console.log('Testing Speech API with real audio file...');
    
    // Read the audio file
    const audioPath = '/Users/gelvihleonid/Documents/AiDEV/CODEPROJECTS/tg_temp_mac/Untitled.m4a';
    
    if (!fs.existsSync(audioPath)) {
      console.error('Audio file not found:', audioPath);
      return;
    }
    
    const audioBuffer = fs.readFileSync(audioPath);
    console.log('Audio file loaded, size:', audioBuffer.length, 'bytes');
    
    // Create FormData
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/m4a' });
    formData.append('audio', audioBlob, 'Untitled.m4a');
    
    console.log('Sending request to speech API...');
    
    const response = await fetch('https://starun-production.up.railway.app/api/speech', {
      method: 'POST',
      body: formData,
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    console.log('Response headers:');
    for (let [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n=== PARSED RESPONSE ===');
        console.log('Success:', data.success);
        console.log('Text:', data.text);
        console.log('Confidence:', data.confidence);
        if (data.error) console.log('Error:', data.error);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
      }
    } else {
      console.error('API request failed');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testSpeechAPIWithRealFile();