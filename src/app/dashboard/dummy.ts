// contoh: /lib/data/sidebarData.ts
export const sidebarData = {
    quickActions: [
        { title: "Create", icon: "plus", type: "button" },
    ],
    main: [
        { title: "Home", url: "/dashboard/home", icon: "home" },
        { title: "My Tasks", url: "/dashboard/tasks", icon: "check-circle" },
        { title: "Inbox", url: "/dashboard/inbox", icon: "bell" },
    ],
    groups: [
        {
            title: "Insights",
            collapsible: true,
            items: [
                { title: "Reports", url: "/dashboard/insights/reports" },
                { title: "Analytics", url: "/dashboard/insights/analytics" },
            ],
        },
        {
            title: "Projects",
            collapsible: true,
            items: [
                { title: "ACCOUNTING", color: "#FFA573", url: "/dashboard/projects/accounting" },
                { title: "AMS WEB", color: "#EBA1E7", url: "/dashboard/projects/ams-web" },
                { title: "APPROVAL", color: "#B99FFF", url: "/dashboard/projects/approval" },
                { title: "BACKUP", color: "#7EC8E3", url: "/dashboard/projects/backup" },
                { title: "BUDGETING", color: "#7EA3E3", url: "/dashboard/projects/budgeting" },
                { title: "GENERAL AFFAIR", color: "#7EE3A8", url: "/dashboard/projects/general-affair" },
                { title: "MEMBERSHIP", color: "#E37E7E", url: "/dashboard/projects/membership" },
                { title: "ONLINE SHOP", color: "#A37EE3", url: "/dashboard/projects/online-shop" },
                { title: "POS", color: "#7EA9E3", url: "/dashboard/projects/pos" },
                { title: "REALTIME STOCK", color: "#E3C67E", url: "/dashboard/projects/realtime-stock" },
            ],
        },
    ],
}
