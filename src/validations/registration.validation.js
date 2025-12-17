import { z } from 'zod';

export const registerTeamSchema = z.object({
  teamId: z.number({
    required_error: "Team ID is required",
    invalid_type_error: "Team ID must be a number"
  }).int().positive()
});

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED'], {
    required_error: "Status is required",
    invalid_type_error: "Status must be PENDING, APPROVED, or REJECTED"
  })
});
