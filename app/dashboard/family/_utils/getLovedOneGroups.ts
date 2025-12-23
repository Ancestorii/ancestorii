export function getLovedOneGroups(members: any[]) {
  const groups: Record<string, any[]> = {
    Parents: [],
    Siblings: [],
    Children: [],
    SpousePartner: [],
    Grandparents: [],
    Friends: [],
    AuntiesUncles: [],
    ExtendedFamily: [],
  };

  members.forEach((member) => {
    const role = member.relationship_to_user;
    if (!role) return;

    switch (role) {
      case "parent":
        groups.Parents.push(member);
        break;

      case "sibling":
        groups.Siblings.push(member);
        break;

      case "child":
        groups.Children.push(member);
        break;

      case "partner":
        groups.SpousePartner.push(member);
        break;

      case "grandparent":
        groups.Grandparents.push(member);
        break;

      case "friend":
        groups.Friends.push(member);
        break;

      case "aunt_uncle":
        groups.AuntiesUncles.push(member);
        break;

      case "extended":
        groups.ExtendedFamily.push(member);
        break;

      default:
        break;
    }
  });

  return groups;
}
