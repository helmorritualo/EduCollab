import { joinGroupService, leaveGroupService, getGroupDetailsService, listUserGroupsService, } from "@/services/groupMember.service";
export const joinGroup = async (c) => {
    const { group_code } = await c.req.json();
    const user_id = c.get("user_id");
    await joinGroupService(user_id, group_code);
    return c.json({
        success: true,
        message: "Joined successfully",
    }, 200);
};
export const leaveGroup = async (c) => {
    const group_id = c.req.param("group_id");
    const user_id = c.get("user_id");
    await leaveGroupService(user_id, Number(group_id));
    return c.json({
        success: true,
        message: "Left group successfully",
    });
};
export const getGroupDetails = async (c) => {
    const group_id = c.req.param("group_id");
    const group = await getGroupDetailsService(Number(group_id));
    return c.json({
        success: true,
        message: "Group details retrieved successfully",
        group,
    });
};
export const listUserGroups = async (c) => {
    const user_id = c.get("user_id");
    const groups = await listUserGroupsService(user_id);
    return c.json({
        success: true,
        message: "Groups retrieved successfully",
        groups,
    });
};
