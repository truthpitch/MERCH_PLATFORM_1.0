"use client";

import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { Input, Select } from "@/components/ui/Field";
import type { AddressInput } from "@/lib/schemas";

export const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "IE", label: "Ireland" },
  { value: "AU", label: "Australia" },
  { value: "NZ", label: "New Zealand" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "NL", label: "Netherlands" },
];

interface AddressFieldsProps<T extends FieldValues> {
  prefix: string;
  register: UseFormRegister<T>;
  errors?: FieldErrors<AddressInput>;
  /** autocomplete section, e.g. "billing" or "shipping" */
  section: "billing" | "shipping";
}

export function AddressFields<T extends FieldValues>({ prefix, register, errors, section }: AddressFieldsProps<T>) {
  const name = (k: keyof AddressInput) => `${prefix}.${k}` as Path<T>;
  const ac = (token: string) => `section-${prefix.replace(/\W/g, "")} ${section} ${token}`;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="First name" autoComplete={ac("given-name")} error={errors?.firstName?.message} {...register(name("firstName"))} />
      <Input label="Last name" autoComplete={ac("family-name")} error={errors?.lastName?.message} {...register(name("lastName"))} />
      <Input label="Address" autoComplete={ac("address-line1")} wrapperClassName="sm:col-span-2" error={errors?.line1?.message} {...register(name("line1"))} />
      <Input label="Apartment, suite, etc." optional autoComplete={ac("address-line2")} wrapperClassName="sm:col-span-2" {...register(name("line2"))} />
      <Input label="City" autoComplete={ac("address-level2")} error={errors?.city?.message} {...register(name("city"))} />
      <Input label="State / region" autoComplete={ac("address-level1")} error={errors?.region?.message} {...register(name("region"))} />
      <Input label="Postal code" autoComplete={ac("postal-code")} error={errors?.postalCode?.message} {...register(name("postalCode"))} />
      <Select label="Country" autoComplete={ac("country")} options={COUNTRIES} error={errors?.country?.message} {...register(name("country"))} />
    </div>
  );
}
