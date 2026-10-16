const LoggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp} ${req.method} ${req.url} - IP: ${req.ip}]`);
  const start = Date.now();
  const duration = Date.now() - start;
  console.log(`[${timestamp}] Response: ${res.statusCode} - ${duration}ms`);

res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] Response: ${res.statusCode} - ${duration}ms`);
  });

  //el next es para que continue con el siguiente middleware o con la ruta que se esta ejecutando
  next();
};

module.exports = LoggerMiddleware;

