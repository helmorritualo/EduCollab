import { getAllGroupsService, getGroupByIdService, createGroupService, updateGroupService, deleteGroupService, } from "@/services/group.service";
export const getAllGroups = async (c) => {
    const groups = await getAllGroupsService();
    return c.json({
        success: true,
        message: "Groups retrieved successfully",
        groups,
    }, 200);
};
export const getGroupById = async (c) => {
    const groupId = c.req.param("group_id");
    const group = await getGroupByIdService(Number(groupId));
    return c.json({
        success: true,
        message: "Group retrieved successfully",
        group,
    }, 200);
};
export const createGroup = async (c) => {
    const group = await c.req.json();
    const user_id = c.get("user_id");
    const groupWithCreator = { ...group, created_by: user_id };
    const newGroup = await createGroupService(groupWithCreator);
    return c.json({
        success: true,
        message: "Group created successfully",
        group: newGroup,
    }, 201);
};
export const updateGroup = async (c) => {
    const groupId = c.req.param("group_id");
    const groupData = await c.req.json();
    const updatedGroup = await updateGroupService(Number(groupId), groupData);
    return c.json({
        success: true,
        message: "Group updated successfully",
        group: updatedGroup,
    }, 201);
};
export const deleteGroup = async (c) => {
    const groupId = c.req.param("group_id");
    await deleteGroupService(Number(groupId));
    return c.json({
        success: true,
        message: "Group deleted successfully",
    }, 200);
};
