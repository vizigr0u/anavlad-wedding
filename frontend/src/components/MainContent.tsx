import './style/MainContent.css'

import { isIOS } from 'react-device-detect';
import React, { useEffect, createRef, useState } from 'react';
import FlippableCard from './FlippableCard';
import FrontCard from './FrontCard';
import BackCard from './BackCard';
import { LoginStatus, WeddingData } from '../types';

// scroll debug:
// document.querySelectorAll("*").forEach(element => element.addEventListener("scroll", ({target}) => console.log(target, target.id, target.parent, target.parent.id)));

// overflow debug:
// document.querySelectorAll('*').forEach(element => {
//     const box = element.getBoundingClientRect();

//     if (box.left < 0 || box.right > document.documentElement.offsetWidth) {
//         console.log(element);
//     }
// });

const ScrollSpacer = React.forwardRef<HTMLDivElement, {}>((_props, ref) => {
    return <div ref={ref} className='scroll-spacer'></div>
});

export default function MainContent({ weddingData, loginStatus, children }: { weddingData: WeddingData | undefined, loginStatus: LoginStatus, children: React.ReactNode }) {
    const [showFront, setShowFront] = useState(true);

    const mainRef = createRef<HTMLElement>();
    const frontCardRef = createRef<HTMLDivElement>();
    const backCardRef = createRef<HTMLDivElement>();
    const backCardContentRef = createRef<HTMLDivElement>();
    const scrollSpacerRef = createRef<HTMLDivElement>();

    const getFrontHeight = () => frontCardRef?.current?.scrollHeight ?? window.innerHeight;
    const getBackHeight = () => Math.max(getFrontHeight(), backCardRef?.current?.scrollHeight ?? 0);

    // const virtualHeaderHeightRatio = 0.5; // how much of the screen to scroll to pass the header
    function getSpacerHeight() {
        const totalHeight = getFrontHeight() + getBackHeight();
        // console.log(`total scroll: ${getFrontHeight()} + ${getBackHeight()} = ${totalHeight}`);
        return totalHeight;
    }

    useEffect(() => {
        // console.log("effect!");
        if (loginStatus !== LoginStatus.LoggedIn)
            return;
        initScroll();
        window.addEventListener('scroll', onScroll);
        return (() => window.removeEventListener('scroll', onScroll));
    })

    function sizeScrollSpacer() {
        if (scrollSpacerRef?.current) {
            scrollSpacerRef.current.style.height = `${getSpacerHeight()}px`;
            // console.log(`ScrollSpacer resized to ${scrollSpacerRef.current.style.height}`);
        }
    }

    function initScroll() {
        sizeScrollSpacer();
        if (backCardContentRef?.current)
            new ResizeObserver(sizeScrollSpacer).observe(backCardContentRef?.current);
    }

    function setTransform(el: HTMLElement, transform: string) {
        el.style.transform = transform;
    }

    const clamp = (num: number, min: number, max: number): number => Math.min(Math.max(num, min), max);

    function applyScroll(target: HTMLElement, scrollY: number) {
        const frontCard = frontCardRef?.current;
        const backCard = backCardRef?.current;
        if (!frontCard || !backCard)
            return;

        const frontHeight = frontCard.scrollHeight;
        const backHeight = backCard.scrollHeight;
        const frontBackRatio = frontHeight / Math.max(1, backHeight);

        const maxScroll = target.scrollHeight - target.clientHeight;
        const maxFlipScroll = frontBackRatio * maxScroll;

        // console.log(`scroll: ${scrollY}/${maxScroll} (maxFlip: ${scrollY - maxFlipScroll})`);
        const angleRatio = clamp(scrollY / maxFlipScroll, 0, 1);
        // const scrollRatio = clamp(scrollY / maxScroll, 0, 1);
        const angle = 180 * angleRatio;
        const backAngle = 180 + angle;
        const backOffset = Math.min(0, maxFlipScroll - scrollY);
        const frontTransform = `rotateX(${angle.toFixed(1)}deg)`;
        const backTransform = `rotateX(${backAngle.toFixed(1)}deg) translateY(${backOffset.toFixed(1)}px)`;
        // console.log(`tranforms: ${frontTransform} - ${backTransform}`);

        setTransform(frontCard, frontTransform);
        setTransform(backCard, backTransform);
        setShowFront(angle < 90);
    }

    let scheduledAnimationFrame: boolean;
    function onScroll() {
        const scrollY = window.scrollY;
        // Prevent multiple rAF callbacks.
        if (scheduledAnimationFrame) {
            return;
        }

        scheduledAnimationFrame = true;
        window.requestAnimationFrame(function () {
            applyScroll(document.documentElement, scrollY);
            scheduledAnimationFrame = false;
        });
    }

    const mainClasses = 'main-content' + (isIOS ? '' : ' main-content__not-ios');
    const loggedIn = loginStatus === LoginStatus.LoggedIn;

    return <>
        <main ref={mainRef} className={mainClasses}>
            <FlippableCard ref={frontCardRef} show={showFront} styleName={'front'}>
                <FrontCard getHeaderHeight={getFrontHeight} weddingData={weddingData} loginStatus={loginStatus} />
            </FlippableCard>
            {loggedIn && <FlippableCard ref={backCardRef} show={!showFront} styleName={'back'} >
                {weddingData && <BackCard ref={backCardContentRef} weddingData={weddingData}>
                    {children}
                </BackCard>}
            </FlippableCard>}
        </main>
        {loggedIn && <ScrollSpacer ref={scrollSpacerRef} />}
    </>;
}
