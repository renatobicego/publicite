import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/client-react-streaming";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { from } from "@apollo/client";

const removeTypenameLink = removeTypenameFromVariables();
const httpLink = new HttpLink({
  uri: process.env.GRAPQL_URL as string,
});

const link = from([removeTypenameLink, httpLink]);
export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });
});

// Los servicios se llaman tanto desde Server Components como desde Server
// Actions / route handlers. El atajo `query` de registerApolloClient avisa por
// consola en estos últimos (ahí React `cache` no tiene scope de request), así
// que resolvemos el cliente nosotros: mismo comportamiento, sin el warning.
export const query: ApolloClient<unknown>["query"] = async (options) =>
  (await getClient()).query(options);
