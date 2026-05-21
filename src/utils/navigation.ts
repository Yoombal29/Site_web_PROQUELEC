


/**
 * Returns the correct dashboard path based on the user's role.
 */
export function getDashboardPath(role: AppRole | string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "secondary_admin":
      return "/admin-secondary";
    case "partner":
      return "/partner";
    case "electricien":
      return "/dashboard/electricien";
    case "entreprise":
      return "/dashboard/entreprise";
    case "membre":
      return "/dashboard/membre";
    default:
      return "/dashboard";
  }
}