export default function TabSkeleton() {
    return (
        <div className="animate-pulse space-y-4 px-6">
            {/* Header */}
            <div className="h-8 w-50 rounded-lg bg-muted mb-6" />

            {/* Main Content */}
            <div className="h-80 w-full rounded-lg bg-muted" />

            {/* Footer (right aligned button/element) */}
            <div className="flex justify-end gap-4">
                <div className="h-8 w-1/10 rounded-lg bg-muted" />
                <div className="h-8 w-1/3 rounded-lg bg-muted" />

            </div>
        </div>
    );
}
