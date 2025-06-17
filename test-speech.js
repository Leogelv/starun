const fs = require('fs');
const FormData = require('form-data');

async function testSpeechAPI() {
  try {
    console.log('Testing Speech API...');
    
    // Create a simple WebM audio blob for testing
    const audioData = Buffer.from([
      0x1A, 0x45, 0xDF, 0xA3, // EBML header
      // Simple WebM header - minimal valid WebM file
      0x42, 0x86, 0x81, 0x01, // Version
      0x42, 0xF7, 0x81, 0x01, // ReadVersion  
      0x42, 0xF2, 0x81, 0x04, // MaxIDLength
      0x42, 0xF3, 0x81, 0x08, // MaxSizeLength
      0x42, 0x82, 0x88, 0x6D, 0x61, 0x74, 0x72, 0x6F, 0x73, 0x6B, 0x61, // DocType
      0x42, 0x87, 0x81, 0x04, // DocTypeVersion
      0x42, 0x85, 0x81, 0x02  // DocTypeReadVersion
    ]);
    
    const formData = new FormData();
    formData.append('audio', audioData, {
      filename: 'test.webm',
      contentType: 'audio/webm'
    });
    
    const response = await fetch('http://localhost:3000/api/speech', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('Parsed response:', data);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testSpeechAPI();