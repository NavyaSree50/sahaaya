/**
 * Sahaaya Real-Time WebSocket Event Handler
 */

function setupSockets(io) {
  io.on('connection', (socket) => {
    // Join volunteer coordinators broadcast channel
    socket.on('join:coordinators', () => {
      socket.join('room:coordinators');
    });

    // Join admin dashboard broadcast channel
    socket.on('join:admin', () => {
      socket.join('room:admin');
    });

    // Join specific incident tracking room
    socket.on('join:incident', (trackingCode) => {
      if (trackingCode) {
        socket.join(`incident:${trackingCode}`);
      }
    });

    socket.on('leave:incident', (trackingCode) => {
      if (trackingCode) {
        socket.leave(`incident:${trackingCode}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}

module.exports = {
  setupSockets
};
