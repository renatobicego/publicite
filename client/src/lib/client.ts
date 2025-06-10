import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { from } from "@apollo/client";

const removeTypenameLink = removeTypenameFromVariables();
const httpLink = new HttpLink({
  uri: process.env.GRAPQL_URL as string,
});

const link = from([removeTypenameLink, httpLink]);
export const { getClient, query } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link,
  });
});
