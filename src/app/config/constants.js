/**
 * Note that @FD-API@ is replaced via SED in the Docker environment to be set to the configured ENGINE_URL
 */

export const ENGINE_URL = '@FD-API@';

export const USER_ROLES = {
  all: '*',
  admin: 'ROLE_FD_ADMIN',
  user: 'ROLE_FD_USER'
};
