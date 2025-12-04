import MarketCard from "@/components/MarketCard"

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
      { title: "More than 6.5", popularity: 0.77 },
      { title: "Less than 6.5", popularity: 0.23 },
    ],
  },
  {
    title: "Total game time?",
    outcomes: [
      { title: "< 34:59", popularity: 0.2 },
      { title: "> 35:00", popularity: 0.3 },
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
    title: "How many deaths will Saigo have?",
    outcomes: [
      { title: "> 4.5", popularity: 0.4 },
      { title: "≤ 4.5", popularity: 0.6 },
    ],
  },
  {
    title: "Total kills in the game?",
    outcomes: [
      { title: "Over 45.5", popularity: 0.32 },
      { title: "Under 45.5", popularity: 0.68 },
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
    title: "Will Baron be taken before 22:00?",
    outcomes: [
      { title: "Yes", popularity: 0.41 },
      { title: "No", popularity: 0.59 },
    ],
  },
  {
    title: "Total towers destroyed by Team 1",
    outcomes: [
      { title: "0-5 towers", popularity: 0.33 },
      { title: "6+ towers", popularity: 0.67 },
    ],
  },
  {
    title: "Which lane gets ganked first?",
    outcomes: [
      { title: "Top lane", popularity: 0.3 },
      { title: "Mid lane", popularity: 0.4 },
      { title: "Bot lane", popularity: 0.3 },
    ],
  },
]

export default function Wagers() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {markets.map((market, index) => (
        <MarketCard key={index} market={market.title} outcomes={market.outcomes} />
      ))}
    </div>
  )
}
