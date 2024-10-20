
export const getBuiltInSettingMode = (activityRule: string) => {
    if (!activityRule) {
        return 'UNDEFINED_VIEW_POLICY'
    }
    if (activityRule === '*:0') {
        return 'VIEW_POLICY_DEFAULT'
    }
    if (activityRule === '*:1') {
        return 'VIEW_POLICY_STRETCH'
    }
    if (activityRule === '*:2') {
        return 'VIEW_POLICY_AUTO_COLUMNS'
    }
    if (activityRule === '*:6') {
        return 'VIEW_POLICY_FLOAT'
    }

    return 'CUSTOM_VIEW_POLICY'
}