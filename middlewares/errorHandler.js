const errorHandler = (err, req, res, next) => {
  //para manejar errores de manera centralizada en la aplicación
  const statusCode = err.statusCode || 500;
  const message = err.message || "Ocurrio un error inesperado";

  console.log(`[ERROR] ${new Date().toISOString()} - ${statusCode} - ${message}`);

  if (err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    //desestrucrurar el stack solo si estamos en desarrollo para no exponer información sensible en producción
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
