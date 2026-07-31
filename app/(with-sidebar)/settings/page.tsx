import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Page() {
  return (
    <div className="mx-auto min-h-screen w-full max-w-xl">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Rank</FieldLegend>
          <FieldDescription>Ranks are not displayed publicly.</FieldDescription>
          <Field>
            <FieldLabel>What is your peak rank?</FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Peak rank" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="peak-rank-iron">Iron+</SelectItem>
                  <SelectItem value="peak-rank-bronze">Bronze+</SelectItem>
                  <SelectItem value="peak-rank-silver">Silver+</SelectItem>
                  <SelectItem value="peak-rank-gold">Gold+</SelectItem>
                  <SelectItem value="peak-rank-platinum">Platinum+</SelectItem>
                  <SelectItem value="peak-rank-emerald">Emerald+</SelectItem>
                  <SelectItem value="peak-rank-diamond">Diamond+</SelectItem>
                  <SelectItem value="peak-rank-master">Master+</SelectItem>
                  <SelectItem value="peak-rank-grandmaster">
                    Grandmaster+
                  </SelectItem>
                  <SelectItem value="peak-rank-challenger">
                    Challenger
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>
              How many seasons (NOT splits) has it been since your peak rank?
            </FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seasons since peak" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="seasons-0">0</SelectItem>
                  <SelectItem value="seasons-1">1</SelectItem>
                  <SelectItem value="seasons-2">2</SelectItem>
                  <SelectItem value="seasons-3">3</SelectItem>
                  <SelectItem value="seasons-4">4</SelectItem>
                  <SelectItem value="seasons-5">5</SelectItem>
                  <SelectItem value="seasons-6">6</SelectItem>
                  <SelectItem value="seasons-7">7</SelectItem>
                  <SelectItem value="seasons-8">8</SelectItem>
                  <SelectItem value="seasons-9">9</SelectItem>
                  <SelectItem value="seasons-10">10</SelectItem>
                  <SelectItem value="seasons-11">11</SelectItem>
                  <SelectItem value="seasons-12">12</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>
              What is your current rank? (Guess if you are unranked)
            </FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Current rank" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="current-rank-iron">Iron+</SelectItem>
                  <SelectItem value="current-rank-bronze">Bronze+</SelectItem>
                  <SelectItem value="current-rank-silver">Silver+</SelectItem>
                  <SelectItem value="current-rank-gold">Gold+</SelectItem>
                  <SelectItem value="current-rank-platinum">
                    Platinum+
                  </SelectItem>
                  <SelectItem value="current-rank-emerald">Emerald+</SelectItem>
                  <SelectItem value="current-rank-diamond">Diamond+</SelectItem>
                  <SelectItem value="current-rank-master">Master+</SelectItem>
                  <SelectItem value="current-rank-grandmaster">
                    Grandmaster+
                  </SelectItem>
                  <SelectItem value="current-rank-challenger">
                    Challenger
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend>Skill Estimates</FieldLegend>
          <FieldDescription>
            Make your best guesses on your skill level in each role.
          </FieldDescription>
          <Field>
            <FieldLabel>
              What is your best estimate on your skill level in the top lane?
            </FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Top lane skill" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="top-iron">Iron+</SelectItem>
                  <SelectItem value="top-bronze">Bronze+</SelectItem>
                  <SelectItem value="top-silver">Silver+</SelectItem>
                  <SelectItem value="top-gold">Gold+</SelectItem>
                  <SelectItem value="top-platinum">Platinum+</SelectItem>
                  <SelectItem value="top-emerald">Emerald+</SelectItem>
                  <SelectItem value="top-diamond">Diamond+</SelectItem>
                  <SelectItem value="top-master">Master+</SelectItem>
                  <SelectItem value="top-grandmaster">Grandmaster+</SelectItem>
                  <SelectItem value="top-challenger">Challenger</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>
              What is your best estimate on your skill level in the jungle?
            </FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Jungle skill" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="jungle-iron">Iron+</SelectItem>
                  <SelectItem value="jungle-bronze">Bronze+</SelectItem>
                  <SelectItem value="jungle-silver">Silver+</SelectItem>
                  <SelectItem value="jungle-gold">Gold+</SelectItem>
                  <SelectItem value="jungle-platinum">Platinum+</SelectItem>
                  <SelectItem value="jungle-emerald">Emerald+</SelectItem>
                  <SelectItem value="jungle-diamond">Diamond+</SelectItem>
                  <SelectItem value="jungle-master">Master+</SelectItem>
                  <SelectItem value="jungle-grandmaster">
                    Grandmaster+
                  </SelectItem>
                  <SelectItem value="jungle-challenger">Challenger</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>
              What is your best estimate on your skill level in the mid lane?
            </FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Mid lane skill" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="mid-iron">Iron+</SelectItem>
                  <SelectItem value="mid-bronze">Bronze+</SelectItem>
                  <SelectItem value="mid-silver">Silver+</SelectItem>
                  <SelectItem value="mid-gold">Gold+</SelectItem>
                  <SelectItem value="mid-platinum">Platinum+</SelectItem>
                  <SelectItem value="mid-emerald">Emerald+</SelectItem>
                  <SelectItem value="mid-diamond">Diamond+</SelectItem>
                  <SelectItem value="mid-master">Master+</SelectItem>
                  <SelectItem value="mid-grandmaster">Grandmaster+</SelectItem>
                  <SelectItem value="mid-challenger">Challenger</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>
              What is your best estimate on your skill level in the bot lane?
            </FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Bot lane skill" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="bot-iron">Iron+</SelectItem>
                  <SelectItem value="bot-bronze">Bronze+</SelectItem>
                  <SelectItem value="bot-silver">Silver+</SelectItem>
                  <SelectItem value="bot-gold">Gold+</SelectItem>
                  <SelectItem value="bot-platinum">Platinum+</SelectItem>
                  <SelectItem value="bot-emerald">Emerald+</SelectItem>
                  <SelectItem value="bot-diamond">Diamond+</SelectItem>
                  <SelectItem value="bot-master">Master+</SelectItem>
                  <SelectItem value="bot-grandmaster">Grandmaster+</SelectItem>
                  <SelectItem value="bot-challenger">Challenger</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>
              What is your best estimate on your skill level as support?
            </FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Support skill" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="support-iron">Iron+</SelectItem>
                  <SelectItem value="support-bronze">Bronze+</SelectItem>
                  <SelectItem value="support-silver">Silver+</SelectItem>
                  <SelectItem value="support-gold">Gold+</SelectItem>
                  <SelectItem value="support-platinum">Platinum+</SelectItem>
                  <SelectItem value="support-emerald">Emerald+</SelectItem>
                  <SelectItem value="support-diamond">Diamond+</SelectItem>
                  <SelectItem value="support-master">Master+</SelectItem>
                  <SelectItem value="support-grandmaster">
                    Grandmaster+
                  </SelectItem>
                  <SelectItem value="support-challenger">Challenger</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldSet>
        <FieldSeparator />
        <FieldSet>
          <FieldLegend>Role Preferences</FieldLegend>
          <FieldDescription>
            Roles you select here will be avoided when autobalancing teams.
          </FieldDescription>
          <Field>
            <FieldLabel>
              Are there any roles you absolutely do NOT want to play?
            </FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rejected roles" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="reject-top">Top</SelectItem>
                  <SelectItem value="reject-jungle">Jungle</SelectItem>
                  <SelectItem value="reject-middle">Middle</SelectItem>
                  <SelectItem value="reject-bottom">Bottom</SelectItem>
                  <SelectItem value="reject-support">Support</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>
              Are there any roles you would prefer not to play?
            </FieldLabel>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Disliked roles" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectItem value="dislike-top">Top</SelectItem>
                  <SelectItem value="dislike-jungle">Jungle</SelectItem>
                  <SelectItem value="dislike-middle">Middle</SelectItem>
                  <SelectItem value="dislike-bottom">Bottom</SelectItem>
                  <SelectItem value="dislike-support">Support</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldSet>
      </FieldGroup>
    </div>
  )
}
