const fs = require('fs');

const path = require('path');

const setupStream = (request, response, filepath, type) => {
  // Get the file object based on the desired video
  const file = path.resolve(__dirname, filepath);

  fs.stat(file, (err, stats) => {
    // If there was an error in the process...
    if (err) {
      // Error: No Entry (ENOENT; file not found)
      if (err.code === 'ENOENT') {
        response.writeHead(404);
      }

      // Abort the function
      return response.end(err);
    }

    // Get the range of the file that's being streamed
    let { range } = request.headers;

    // If there is no range, default to the entire thing
    if (!range) {
      range = 'bytes=0-';
    }

    // Parse the range into variables "start" and "end"
    const positions = range.replace('bytes=', '').split('-');

    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    // Reposition the start value if necessary
    if (start > end) {
      start = end - 1;
    }

    // Size of the file in bytes
    const chunksize = (end - start) + 1;

    // Partial content success code
    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': type,
    });

    // Start the stream!
    const stream = fs.createReadStream(file, { start, end });

    // If the stream is open, pipe it straight to the client response!
    stream.on('open', () => {
      stream.pipe(response);
    });

    // If the stream's thrown an error, end the response and return the error.
    stream.on('error', (streamErr) => {
      response.end(streamErr);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  setupStream(request, response, '../client/party.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  setupStream(request, response, '../client/bling.mp3', 'audio/mpeg');
};

const getBird = (request, response) => {
  setupStream(request, response, '../client/bird.mp4', 'video/mp4');
};

module.exports.getParty = getParty;
module.exports.getBling = getBling;
module.exports.getBird = getBird;