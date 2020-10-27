import routes from '../../content/routes';

const exampleRoutes = routes.filter(
  ({ path }) => path && path.includes('/examples/')
);
export const exampleNames = exampleRoutes.map(({ name }) => name).sort();
