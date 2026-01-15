
import ReportTabs from './report-tabs';

export default function ReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="w-full">
            <div className="mb-4">
                <h1 className="text-2xl font-bold dark:text-gray-100 mb-6">Reports</h1>
                <ReportTabs />
            </div>
            {children}
        </div>
    );
}
