"use client";

import { Loader2, Save } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

/**
 * Editable profile details (§10 settings flow). Fully controlled by the page
 * so the dirty check, leave guard, and save payload keep a single source of
 * truth there; this component is the form markup only.
 */

export function ProfileDetailsForm({
  fullName,
  onFullNameChange,
  district,
  onDistrictChange,
  language,
  onLanguageChange,
  gender,
  onGenderChange,
  genderSelfDescribed,
  onGenderSelfDescribedChange,
  districts,
  saving,
  saveDisabled,
  onSave,
}: {
  fullName: string;
  onFullNameChange: (value: string) => void;
  district: string;
  onDistrictChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  gender: string;
  onGenderChange: (value: string) => void;
  genderSelfDescribed: string;
  onGenderSelfDescribedChange: (value: string) => void;
  districts: string[];
  saving: boolean;
  saveDisabled: boolean;
  onSave: () => void;
}) {
  return (
    <Card id="profile-details" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Profile Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => onFullNameChange(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Select value={district} onValueChange={onDistrictChange}>
              <SelectTrigger id="district" className="w-full">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent>
                {districts.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={onLanguageChange}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EN">English</SelectItem>
                <SelectItem value="HI">हिंदी (Hindi)</SelectItem>
                <SelectItem value="MR">मराठी (Marathi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={gender} onValueChange={onGenderChange}>
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="NON_BINARY">Non-binary</SelectItem>
                <SelectItem value="SELF_DESCRIBED">Prefer to self-describe</SelectItem>
                <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
            {gender === "SELF_DESCRIBED" ? (
              <>
                <Label htmlFor="genderSelfDescribed">Describe your gender</Label>
                <Input
                  id="genderSelfDescribed"
                  value={genderSelfDescribed}
                  onChange={(e) => onGenderSelfDescribedChange(e.target.value)}
                  maxLength={100}
                />
              </>
            ) : null}
          </div>
        </div>

        <Button
          className="mt-6 gap-2"
          onClick={onSave}
          disabled={saveDisabled}
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
