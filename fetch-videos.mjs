import https from 'https';

const API_KEY = process.env.PEXELS_API_KEY || 'Gg7RFCF7Ujm37EBnCs9PueZqEddV8TfjirGvuslrh6IjZpHWkGPKt9B0';

const options = {
  hostname: 'api.pexels.com',
  path: '/videos/search?query=jewelry&per_page=8&orientation=portrait',
  headers: {
    'Authorization': API_KEY
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const videos = json.videos.map(v => {
        // Find highest quality sd or hd mp4
        const file = v.video_files.find(f => f.file_type === 'video/mp4' && (f.quality === 'hd' || f.quality === 'sd')) || v.video_files[0];
        return file.link;
      });
      console.log(JSON.stringify(videos, null, 2));
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
