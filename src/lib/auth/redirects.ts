export function getPostLoginRedirect(roles: string[]) {
  if (roles.includes("super_admin") || roles.includes("admin")) {
    return "/admin";
  }

  return "/dashboard";
}
