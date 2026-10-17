import { catalogRepository } from "./catalog.repository";

export const catalogService = {
  listMovies() {
    return catalogRepository.listActiveMovies();
  },
  listShows(movieId: string, date: string) {
    return catalogRepository.listShows(movieId, date);
  },
};
