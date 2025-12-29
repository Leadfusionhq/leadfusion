"use client";
import * as Yup from "yup";
import { LEAD_TYPE, EXCLUSIVITY, STATUS, DAYS_OF_WEEK, LANGUAGE, UTILITIES } from "@/constants/enums";

export const validationSchema = Yup.object().shape({
    name: Yup.string().required("Campaign name is required"),
    status: Yup.string().oneOf(Object.values(STATUS)).required("Status is required"),
    lead_type: Yup.string().oneOf(Object.values(LEAD_TYPE)).required("Lead type is required"),
    exclusivity: Yup.string().oneOf(Object.values(EXCLUSIVITY)).required("Exclusivity is required"),
    bid_price: Yup.number().min(0, "Bid price must be positive").required("Bid price is required"),
    language: Yup.string().required("Language is required"),
    poc_phone: Yup.string().when("exclusivity", {
      is: "WARM_TRANSFER",
      then: (schema) =>
        schema
          .matches(/^[\d\s\-().+]+$/, "Invalid phone number format")
          .required("POC Phone is required for Warm Transfer"),
      otherwise: (schema) => schema.notRequired(),
    }),
    company_contact_phone: Yup.string().when("exclusivity", {
      is: "APPOINTMENT",
      then: (schema) =>
        schema
          .matches(/^[\d\s\-().+]+$/, "Invalid phone number format")
          .required("Company Contact Phone is required for Appointment"),
      otherwise: (schema) => schema.notRequired(),
    }),
    company_contact_email: Yup.string().when("exclusivity", {
      is: "APPOINTMENT",
      then: (schema) =>
        schema
          .email("Invalid email address")
          .required("Company Contact Email is required for Appointment"),
      otherwise: (schema) => schema.notRequired(),
    }),
    geography: Yup.object().shape({
      state: Yup.mixed().nullable(),
      coverage: Yup.object().shape({
        type: Yup.string().oneOf(["FULL_STATE", "PARTIAL"]).required("Coverage type is required"),
        partial: Yup.object().shape({
          counties: Yup.array(),
          radius: Yup.string(),
          zipcode: Yup.string().test(
            'valid-zipcode',
            'ZIP code must be exactly 5 digits',
            (value) => !value || /^\d{5}$/.test(value)
          ),
          zip_codes: Yup.string(),
          countries: Yup.array().of(Yup.string()),
        }),
      }),
    }),
    utilities: Yup.object().shape({
      mode: Yup.string().oneOf(Object.values(UTILITIES)).required("Mode is required"),
      exclude_some: Yup.array(),
      include_some: Yup.array(),
    }),
    delivery: Yup.object().shape({
      method: Yup.array()
        .min(1, "At least one delivery method is required")
        .required("Delivery method is required"),

      email: Yup.object().shape({
        addresses: Yup.string(),
        subject: Yup.string(),
      }),

      phone: Yup.object().shape({
        numbers: Yup.string(),
      }),

      crm: Yup.object().shape({
        instructions: Yup.string(),
      }),

      other: Yup.object().shape({
        homeowner_count: Yup.number().min(0, "Must be positive"),
      }),

      schedule: Yup.object(),
    }),

    note: Yup.string(),
  });