import { ProfileSettingsForm } from "@/components/profile-settings-form"
import { SSOSettingsForm } from "@/components/sso-settings-form"
import { Button } from "@/components/ui/button"
import {
  Field,
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
import { updatePlayerSettings } from "./actions"
import { Checkbox } from "@/components/ui/checkbox"
import { InfoIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { eq, getTableColumns } from "drizzle-orm"
import { db } from "@/lib/db"
import { playerSettings, players } from "@/lib/schema"

export default async function Page() {
  const user = await currentUser()

  if (!user) {
    redirect("/signin?redirect_url=/settings")
  }

  const hasRiotAccount = user.externalAccounts.some(
    (account) => account.provider === "oauth_custom_riot_games"
  )

  const [settings] = hasRiotAccount
    ? await db
        .select(getTableColumns(playerSettings))
        .from(playerSettings)
        .innerJoin(players, eq(players.id, playerSettings.playerId))
        .where(eq(players.authId, user.id))
        .limit(1)
    : []

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-16 pb-16">
      <section>
        <ProfileSettingsForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-oswald text-2xl font-semibold uppercase">
          Connected accounts
        </h2>
        <SSOSettingsForm />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-oswald text-2xl font-semibold uppercase">
              Autobalancer Settings
            </h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="mt-1 size-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                These settings are optional. Everyone in a lobby is required to
                fill these out before the autobalancer can be used.
              </TooltipContent>
            </Tooltip>
          </div>

          <Button
            type="submit"
            form="autobalancer-settings"
            size="lg"
            className="font-oswald font-semibold uppercase"
          >
            Save Settings
          </Button>
        </div>
        {hasRiotAccount ? (
          <form id="autobalancer-settings" action={updatePlayerSettings}>
            <FieldGroup>
              <FieldSet>
                <Field>
                  <FieldLabel>What is your peak rank?</FieldLabel>
                  <Select
                    name="peakRank"
                    defaultValue={settings?.peakRank}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Peak rank" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="IRON">Iron+</SelectItem>
                        <SelectItem value="BRONZE">Bronze+</SelectItem>
                        <SelectItem value="SILVER">Silver+</SelectItem>
                        <SelectItem value="GOLD">Gold+</SelectItem>
                        <SelectItem value="PLATINUM">Platinum+</SelectItem>
                        <SelectItem value="EMERALD">Emerald+</SelectItem>
                        <SelectItem value="DIAMOND">Diamond+</SelectItem>
                        <SelectItem value="MASTER">Master+</SelectItem>
                        <SelectItem value="GRANDMASTER">
                          Grandmaster+
                        </SelectItem>
                        <SelectItem value="CHALLENGER">Challenger</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>
                    How many seasons (NOT splits) has it been since your peak
                    rank?
                  </FieldLabel>
                  <Select
                    name="seasonsSincePeak"
                    defaultValue={settings?.seasonsSincePeak.toString()}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seasons since peak" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="6">6</SelectItem>
                        <SelectItem value="7">7</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="9">9</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="11">11</SelectItem>
                        <SelectItem value="12">12</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>
                    What is your current rank? (Guess if you are unranked)
                  </FieldLabel>
                  <Select
                    name="currentRank"
                    defaultValue={settings?.currentRank}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Current rank" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="IRON">Iron+</SelectItem>
                        <SelectItem value="BRONZE">Bronze+</SelectItem>
                        <SelectItem value="SILVER">Silver+</SelectItem>
                        <SelectItem value="GOLD">Gold+</SelectItem>
                        <SelectItem value="PLATINUM">Platinum+</SelectItem>
                        <SelectItem value="EMERALD">Emerald+</SelectItem>
                        <SelectItem value="DIAMOND">Diamond+</SelectItem>
                        <SelectItem value="MASTER">Master+</SelectItem>
                        <SelectItem value="GRANDMASTER">
                          Grandmaster+
                        </SelectItem>
                        <SelectItem value="CHALLENGER">Challenger</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <Field>
                  <FieldLabel>
                    What is your best estimate on your skill level in the top
                    lane?
                  </FieldLabel>
                  <Select
                    name="topSkillRank"
                    defaultValue={settings?.topSkillRank}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Top lane skill" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="IRON">Iron+</SelectItem>
                        <SelectItem value="BRONZE">Bronze+</SelectItem>
                        <SelectItem value="SILVER">Silver+</SelectItem>
                        <SelectItem value="GOLD">Gold+</SelectItem>
                        <SelectItem value="PLATINUM">Platinum+</SelectItem>
                        <SelectItem value="EMERALD">Emerald+</SelectItem>
                        <SelectItem value="DIAMOND">Diamond+</SelectItem>
                        <SelectItem value="MASTER">Master+</SelectItem>
                        <SelectItem value="GRANDMASTER">
                          Grandmaster+
                        </SelectItem>
                        <SelectItem value="CHALLENGER">Challenger</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>
                    What is your best estimate on your skill level in the
                    jungle?
                  </FieldLabel>
                  <Select
                    name="jungleSkillRank"
                    defaultValue={settings?.jungleSkillRank}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Jungle skill" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="IRON">Iron+</SelectItem>
                        <SelectItem value="BRONZE">Bronze+</SelectItem>
                        <SelectItem value="SILVER">Silver+</SelectItem>
                        <SelectItem value="GOLD">Gold+</SelectItem>
                        <SelectItem value="PLATINUM">Platinum+</SelectItem>
                        <SelectItem value="EMERALD">Emerald+</SelectItem>
                        <SelectItem value="DIAMOND">Diamond+</SelectItem>
                        <SelectItem value="MASTER">Master+</SelectItem>
                        <SelectItem value="GRANDMASTER">
                          Grandmaster+
                        </SelectItem>
                        <SelectItem value="CHALLENGER">Challenger</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>
                    What is your best estimate on your skill level in the mid
                    lane?
                  </FieldLabel>
                  <Select
                    name="middleSkillRank"
                    defaultValue={settings?.middleSkillRank}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Mid lane skill" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="IRON">Iron+</SelectItem>
                        <SelectItem value="BRONZE">Bronze+</SelectItem>
                        <SelectItem value="SILVER">Silver+</SelectItem>
                        <SelectItem value="GOLD">Gold+</SelectItem>
                        <SelectItem value="PLATINUM">Platinum+</SelectItem>
                        <SelectItem value="EMERALD">Emerald+</SelectItem>
                        <SelectItem value="DIAMOND">Diamond+</SelectItem>
                        <SelectItem value="MASTER">Master+</SelectItem>
                        <SelectItem value="GRANDMASTER">
                          Grandmaster+
                        </SelectItem>
                        <SelectItem value="CHALLENGER">Challenger</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>
                    What is your best estimate on your skill level in the bot
                    lane?
                  </FieldLabel>
                  <Select
                    name="bottomSkillRank"
                    defaultValue={settings?.bottomSkillRank}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Bot lane skill" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="IRON">Iron+</SelectItem>
                        <SelectItem value="BRONZE">Bronze+</SelectItem>
                        <SelectItem value="SILVER">Silver+</SelectItem>
                        <SelectItem value="GOLD">Gold+</SelectItem>
                        <SelectItem value="PLATINUM">Platinum+</SelectItem>
                        <SelectItem value="EMERALD">Emerald+</SelectItem>
                        <SelectItem value="DIAMOND">Diamond+</SelectItem>
                        <SelectItem value="MASTER">Master+</SelectItem>
                        <SelectItem value="GRANDMASTER">
                          Grandmaster+
                        </SelectItem>
                        <SelectItem value="CHALLENGER">Challenger</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>
                    What is your best estimate on your skill level as support?
                  </FieldLabel>
                  <Select
                    name="supportSkillRank"
                    defaultValue={settings?.supportSkillRank}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Support skill" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectGroup>
                        <SelectItem value="IRON">Iron+</SelectItem>
                        <SelectItem value="BRONZE">Bronze+</SelectItem>
                        <SelectItem value="SILVER">Silver+</SelectItem>
                        <SelectItem value="GOLD">Gold+</SelectItem>
                        <SelectItem value="PLATINUM">Platinum+</SelectItem>
                        <SelectItem value="EMERALD">Emerald+</SelectItem>
                        <SelectItem value="DIAMOND">Diamond+</SelectItem>
                        <SelectItem value="MASTER">Master+</SelectItem>
                        <SelectItem value="GRANDMASTER">
                          Grandmaster+
                        </SelectItem>
                        <SelectItem value="CHALLENGER">Challenger</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldSet>
                  <FieldLegend variant="label">
                    Are there any roles you absolutely do NOT want to play?
                  </FieldLegend>
                  <FieldGroup
                    data-slot="checkbox-group"
                    className="grid grid-cols-2 gap-3 sm:grid-cols-5"
                  >
                    <Field orientation="horizontal">
                      <Checkbox
                        id="rejected-top"
                        name="rejectedRoles"
                        value="TOP"
                        defaultChecked={settings?.rejectedRoles.includes("TOP")}
                      />
                      <FieldLabel htmlFor="rejected-top">Top</FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="rejected-jungle"
                        name="rejectedRoles"
                        value="JUNGLE"
                        defaultChecked={settings?.rejectedRoles.includes(
                          "JUNGLE"
                        )}
                      />
                      <FieldLabel htmlFor="rejected-jungle">Jungle</FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="rejected-middle"
                        name="rejectedRoles"
                        value="MIDDLE"
                        defaultChecked={settings?.rejectedRoles.includes(
                          "MIDDLE"
                        )}
                      />
                      <FieldLabel htmlFor="rejected-middle">Middle</FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="rejected-bottom"
                        name="rejectedRoles"
                        value="BOTTOM"
                        defaultChecked={settings?.rejectedRoles.includes(
                          "BOTTOM"
                        )}
                      />
                      <FieldLabel htmlFor="rejected-bottom">Bottom</FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="rejected-support"
                        name="rejectedRoles"
                        value="UTILITY"
                        defaultChecked={settings?.rejectedRoles.includes(
                          "UTILITY"
                        )}
                      />
                      <FieldLabel htmlFor="rejected-support">
                        Support
                      </FieldLabel>
                    </Field>
                  </FieldGroup>
                </FieldSet>
                <FieldSet>
                  <FieldLegend variant="label">
                    Are there any roles you would prefer not to play?
                  </FieldLegend>
                  <FieldGroup
                    data-slot="checkbox-group"
                    className="grid grid-cols-2 gap-3 sm:grid-cols-5"
                  >
                    <Field orientation="horizontal">
                      <Checkbox
                        id="disliked-top"
                        name="dislikedRoles"
                        value="TOP"
                        defaultChecked={settings?.dislikedRoles.includes("TOP")}
                      />
                      <FieldLabel htmlFor="disliked-top">Top</FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="disliked-jungle"
                        name="dislikedRoles"
                        value="JUNGLE"
                        defaultChecked={settings?.dislikedRoles.includes(
                          "JUNGLE"
                        )}
                      />
                      <FieldLabel htmlFor="disliked-jungle">Jungle</FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="disliked-middle"
                        name="dislikedRoles"
                        value="MIDDLE"
                        defaultChecked={settings?.dislikedRoles.includes(
                          "MIDDLE"
                        )}
                      />
                      <FieldLabel htmlFor="disliked-middle">Middle</FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="disliked-bottom"
                        name="dislikedRoles"
                        value="BOTTOM"
                        defaultChecked={settings?.dislikedRoles.includes(
                          "BOTTOM"
                        )}
                      />
                      <FieldLabel htmlFor="disliked-bottom">Bottom</FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                      <Checkbox
                        id="disliked-support"
                        name="dislikedRoles"
                        value="UTILITY"
                        defaultChecked={settings?.dislikedRoles.includes(
                          "UTILITY"
                        )}
                      />
                      <FieldLabel htmlFor="disliked-support">
                        Support
                      </FieldLabel>
                    </Field>
                  </FieldGroup>
                </FieldSet>
              </FieldSet>
            </FieldGroup>
          </form>
        ) : (
          <div className="grid h-64 w-full place-items-center rounded-md border p-4">
            <p className="text-sm text-muted-foreground">
              Please connect a Riot account to fill in your autobalancer
              settings
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
