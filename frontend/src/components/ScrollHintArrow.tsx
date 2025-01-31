import './style/ScrollHintArrow.css'

function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

}

// function easeInOutQuart(x) {
//     return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
// }

// smooth scrolling to specific Y
function doScrolling(elementY: number, duration: number) {
    var startingY = window.scrollY;
    var diff = elementY - startingY;
    var start: number;
    // console.log(`scrolling to ${elementY} : diff = ${diff}, duration = ${duration}`);

    // Bootstrap our animation - it will get called right before next frame shall be rendered.
    window.requestAnimationFrame(function step(timestamp) {
        if (!start) start = timestamp;
        // Elapsed milliseconds since start of scrolling.
        const time = timestamp - start;
        // Get percent of completion in range [0, 1].
        const percent = Math.min(time / duration, 1);
        const t = easeInOutCubic(percent);

        window.scrollTo(0, startingY + diff * t);

        // Proceed with animation as long as we wanted it to.
        if (time < duration) {
            window.requestAnimationFrame(step);
        }
    })
}

function DownArrowIcon() {
    return (
        <svg className='down-arrow-icon__svg' viewBox="0 0 20 20">
            <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
        </svg>
    );
}

export default function ScrollHintArrow({ getHeaderHeight }: { getHeaderHeight: () => number }) {
    return (
        <button className='hint-arrow-container' onClick={() => doScrolling(getHeaderHeight(), 1000)}>
            <div className='hint-arrow'><DownArrowIcon /></div>
        </button>
    )
}
