module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  // Los specs de integración comparten la MISMA base de test y limpian con
  // deleteMany({}) en sus afterAll. Corriendo en paralelo, el afterAll de un spec le
  // borra los datos a otro que está a mitad de camino y fallan sin que haya nada roto
  // en el código. Hasta que cada spec tenga su propia base, van en serie.
  maxWorkers: 1,
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
};
