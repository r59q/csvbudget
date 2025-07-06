import { MdAttachMoney, MdMoneyOff, MdCompareArrows, MdHelpOutline } from 'react-icons/md';
import { RiRefund2Line } from "react-icons/ri";

import { TransactionType } from '@/model';

export function getTransactionTypeIcon(type: TransactionType) {
  switch (type) {
    case 'income':
      return MdAttachMoney;
    case 'expense':
      return MdMoneyOff;
    case 'transfer':
      return MdCompareArrows;
    case 'refund':
        return RiRefund2Line;
    case 'unknown':
    default:
      return MdHelpOutline;
  }
}

