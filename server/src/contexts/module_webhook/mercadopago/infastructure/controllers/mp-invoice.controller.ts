import {
  Controller,
  Get,
  Inject,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { MyLoggerService } from 'src/contexts/module_shared/logger/logger.service';
import { ClerkAuthGuard } from 'src/contexts/module_shared/auth/clerk-auth/clerk.auth.guard';
import { InvoiceAdapterInterface } from '../../application/adapter/in/mp-invoice.adapter.internface';

@Controller('invoices')
export class MpInvoiceController {
  constructor(
    private readonly logger: MyLoggerService,
    @Inject('InvoiceAdapterInterface')
    private readonly invoiceAdapter: InvoiceAdapterInterface,
  ) {}

  @Get(':invoiceId/ticket')
  @UseGuards(ClerkAuthGuard)
  async getInvoiceTicket(
    @Param('invoiceId') invoiceId: string,
    @Req() req: Request & { userRequestId?: string },
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`Generando ticket PDF para invoice: ${invoiceId}`);
    const userRequestId = req.userRequestId as string;

    const pdfBuffer = await this.invoiceAdapter.generateInvoiceTicket(
      invoiceId,
      userRequestId,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ticket-${invoiceId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
