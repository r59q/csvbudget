import { MdAttachMoney, MdMoneyOff, MdCompareArrows, MdHelpOutline } from 'react-icons/md';
import { TransactionType } from '@/model';

export function getTransactionTypeIcon(type: TransactionType) {
  switch (type) {
    case 'income':
      return MdAttachMoney;
    case 'expense':
      return MdMoneyOff;
    case 'transfer':
      return MdCompareArrows;
    case 'unknown':
    default:
      return MdHelpOutline;
  }
}

