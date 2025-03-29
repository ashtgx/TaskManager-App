export default function GanttTimelineHeader({ extendedStartDate, extendedEndDate, pxPerDay }) {

    const numDays = Math.floor((extendedEndDate - extendedStartDate) / (1000 * 60 * 60 * 24)) + 1;

    const dateList = Array.from({ length: numDays }, (_, i) => {
        const date = new Date(extendedStartDate);
        date.setDate(date.getDate() + i);
        return date;
    });

    const monthGroups = [];
    let currentMonth = dateList[0].getMonth();
    let startIndex = 0;

    dateList.forEach((date, i) => {
        if (date.getMonth() !== currentMonth) {
            monthGroups.push({
                name: dateList[i - 1].toLocaleString("default", { month: "long" }),
                span: i - startIndex,
            });
            startIndex = i;
            currentMonth = date.getMonth();
        }
    });

    // Push final month
    monthGroups.push({
        name: dateList[dateList.length - 1].toLocaleString("default", { month: "long" }),
        span: dateList.length - startIndex,
    });

    return (
        <div className="flex text-xs font-medium text-gray-600 border-b" style={{ width: `${188+((numDays) * pxPerDay)}px`}}>
            <div className="min-w-47 border-r px-2 py-1 content-center">
                <p>Tasks</p>
            </div>
            <div>
                <div
                    className="flex text-sm font-bold bg-gray-200"
                    style={{ minWidth: `${numDays * pxPerDay}px` }}
                >
                    {monthGroups.map((month, idx) => (
                        <div
                            key={idx}
                            className="text-center border-r border-gray-300"
                            style={{ width: `${month.span * pxPerDay}px` }}
                        >
                            {month.name}
                        </div>
                    ))}
                </div>
                <div
                    className="flex text-xs bg-gray-100"
                    style={{ minWidth: `${numDays * pxPerDay}px` }}
                >
                    {dateList.map((date, idx) => (
                        <div
                            key={idx}
                            className="text-center border-r border-gray-300"
                            style={{ width: `${pxPerDay}px` }}
                        >
                            {date.getDate()}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}