import WagerCard from "@/components/WagerCard"

export default function Wagers() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <WagerCard market={"Which team will win?"} /> {/* option 1 / option 2 */}
      <WagerCard market={"Which player will have the most kills?"} /> {/* multiple choices */}
      <WagerCard market={"How many kills will Saigo get?"} /> {/* over / under */}
      <WagerCard market={"How many times will Kickball die?"} /> {/* over / under */}
      <WagerCard market={"Will there be a pentakill?"} /> {/* yes / no */}
    </div>
  )
}
