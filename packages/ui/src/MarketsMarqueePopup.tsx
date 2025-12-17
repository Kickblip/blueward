"use client"

import Logo from "./Logo"
import MarketCard from "./MarketCard"
import Badge from "./Badge"
import { TbLivePhotoFilled } from "react-icons/tb"
import CrystalIcon from "./CrystalIcon"
import Marquee from "react-fast-marquee"
import { useState } from "react"
import { IoCloseSharp } from "react-icons/io5"

const markets = [
  {
    title: "Will Kickball get a shutdown kill?",
    outcomes: [
      { title: "Yes", popularity: 0.28 },
      { title: "No", popularity: 0.72 },
    ],
  },
  {
    title: "Which team will win?",
    outcomes: [
      { title: "Team 1", popularity: 0.5 },
      { title: "Team 2", popularity: 0.5 },
    ],
  },
  {
    title: "How many kills will Saigo get?",
    outcomes: [
      { title: "Over 6.5", popularity: 0.77 },
      { title: "Under 6.5", popularity: 0.23 },
    ],
  },
  {
    title: "Total game time?",
    outcomes: [
      { title: "Over 35:00", popularity: 0.8 },
      { title: "Under 34:59", popularity: 0.2 },
    ],
  },
  {
    title: "Will Kickball secure first blood?",
    outcomes: [
      { title: "Yes", popularity: 0.35 },
      { title: "No", popularity: 0.65 },
    ],
  },
  {
    title: "Which team will take first dragon?",
    outcomes: [
      { title: "Team 1", popularity: 0.55 },
      { title: "Team 2", popularity: 0.45 },
    ],
  },
  {
    title: "How many deaths will Kickball have?",
    outcomes: [
      { title: "Over 4.5", popularity: 0.4 },
      { title: "Under 4.5", popularity: 0.6 },
    ],
  },
  {
    title: "Will any player get a pentakill?",
    outcomes: [
      { title: "Yes", popularity: 0.12 },
      { title: "No", popularity: 0.88 },
    ],
  },
  {
    title: "Total kills in the game?",
    outcomes: [
      { title: "Over 45.5", popularity: 0.32 },
      { title: "Under 45.5", popularity: 0.68 },
    ],
  },
]

export default function MarketsMarqueePopup() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isOpen ? (
        <div
          className="relative pointer-events-auto flex items-center gap-3
                   rounded-md border border-blue-400/70
                   bg-zinc-950 p-4
                   shadow-lg shadow-blue-400/30"
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-1 right-1 p-1 cursor-pointer rounded-md
                      hover:bg-zinc-800 transition-colors duration-200 z-10"
          >
            <IoCloseSharp />
          </button>

          <div className="flex flex-col gap-2">
            <Badge>
              <TbLivePhotoFilled />
              <span className="text-xs">Live Predictions</span>
            </Badge>
            <Logo />
            <div className="flex items-center gap-1.5 text-xs italic text-zinc-400 max-w-xs">
              <span>* all wagers are </span>
              <div className="flex items-center">
                <CrystalIcon className="text-blue-300" size={14} />
                <span>100</span>
              </div>
            </div>
          </div>

          <div className="max-w-5xl">
            <Marquee
              className="gap-4"
              pauseOnHover={true}
              gradient={true}
              gradientColor="oklch(14.1% 0.005 285.823)"
              gradientWidth={100}
            >
              {markets.map((market, index) => (
                <MarketCard key={index} market={market.title} outcomes={market.outcomes} />
              ))}
            </Marquee>
          </div>
        </div>
      ) : (
        // Not open just show the predictions badge
        <button onClick={() => setIsOpen(true)} className="cursor-pointer">
          <Badge>
            <TbLivePhotoFilled />
            <span className="text-xs">Live Predictions</span>
          </Badge>
        </button>
      )}
    </div>
  )
}
