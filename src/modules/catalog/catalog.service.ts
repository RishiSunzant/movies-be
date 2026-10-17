import { catalogRepository } from "./catalog.repository";

export const catalogService = {
  listMovies() {
    return catalogRepository.listActiveMovies();
  },
};
