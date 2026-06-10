import { z } from "zod";

export const uuid = () => z.string().uuid();

export const isoDate = (message = "Must be a date (yyyy-mm-dd).") =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, message);
