import { UserStatus } from "@prisma/client";

export function getStatusRedirect(userStatus: UserStatus) {
  switch (userStatus) {
    case "pending":
      return "/pending-approval";
    case "approved":
    case "verification_sent":
      return "/verify";
    case "rejected":
      return "/account-status?state=rejected";
    case "blocked":
      return "/account-status?state=blocked";
    default:
      return "/login";
  }
}
