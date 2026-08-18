import { BadRequestException, PipeTransform } from "@nestjs/common";
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) {}

    transform(value: any) {
        const parseResult = this.schema.safeParse(value);
        if(!parseResult.success) {
            throw new BadRequestException({
                message: 'Validation failed',
                errors: parseResult.error.issues,
            });
        }

        return parseResult.data;
    }
}