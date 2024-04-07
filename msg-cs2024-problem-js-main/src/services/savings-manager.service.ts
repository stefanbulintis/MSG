import { AccountsRepository } from '../repository/accounts.repository';
import { AccountType } from '../domain/account-type.enum';
import { SavingsAccountModel } from '../domain/savings-account.model';
import dayjs from 'dayjs';
import { CapitalizationFrequency } from '../domain/capitalization-frequency.enum';

export class SavingsManagerService {
  private systemDate = dayjs().toDate();
  public passTime(): void {
    //aici obtinem conturile de economii
    const savingAccounts = AccountsRepository.getAll().filter(
      account => account.accountType === AccountType.SAVINGS
    ) as SavingsAccountModel[];

    //calculam data pentru urmatoarea luna
    const nextSystemDate = dayjs(this.systemDate).add(1, 'months');


    //se parcurg conturile de economii aplicand dobanda in functie de frecventa
    savingAccounts.forEach(savingAccount => {
      if (savingAccount.interestFrequency === CapitalizationFrequency.MONTHLY) {
        //daca frecventa dobanzii este lunara, adaugam dobanda lunara
        this.addMonthlyInterest(savingAccount, nextSystemDate);
      } else if (savingAccount.interestFrequency === CapitalizationFrequency.QUARTERLY) {
        //daca frecventa dobanzii este trimestriala, adaugam dobanda trimestriala
        this.addQuarterInterest(savingAccount, nextSystemDate)
      }
    });

    //actualizam data sistemului la data pentru urmatoarea luna
    this.systemDate = nextSystemDate.toDate();
  }

  //metoda addQuarterInterest adauga dobanda trimestriala la un cont de economii
  private addQuarterInterest(savingAccount: SavingsAccountModel, currentInterestMonth: dayjs.Dayjs): void {
    //calculam data pentru urmatoarea dobanda la contul respectiv
    const nextInterestDateForAccount = dayjs(savingAccount.lastInterestAppliedDate).add(3, 'months');

    //aici verificam daca data curenta este asemanatoare cu data pentru urmatoarea dobanda
    const sameMonth = currentInterestMonth.isSame(nextInterestDateForAccount, 'month');
    const sameYear = currentInterestMonth.isSame(nextInterestDateForAccount, 'year');

    //daca sunt in aceeasi luna si in acelasi an, se adauga dobanda si se actualizeaza data ultimei dobanzi
    if(sameMonth && sameYear) {
      this.addInterest(savingAccount);
      savingAccount.lastInterestAppliedDate = currentInterestMonth.toDate();
    }
  }

  private addMonthlyInterest(savingAccount: SavingsAccountModel, currentInterestMonth: dayjs.Dayjs): void {
    const nextInterestDateForAccount = dayjs(savingAccount.lastInterestAppliedDate).add(1, 'months');

    const sameMonth = currentInterestMonth.isSame(nextInterestDateForAccount, 'month');
    const sameYear = currentInterestMonth.isSame(nextInterestDateForAccount, 'year');

    if (sameMonth && sameYear) {
      this.addInterest(savingAccount);
      savingAccount.lastInterestAppliedDate = currentInterestMonth.toDate();
    }
  }

  private addInterest(savingAccount: SavingsAccountModel): void {
    savingAccount.balance.amount += savingAccount.balance.amount * savingAccount.interest; // update balance with interest
  }
}

export const SavingsManagerServiceInstance = new SavingsManagerService();
