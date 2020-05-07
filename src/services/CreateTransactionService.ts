import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import { getCustomRepository, getRepository } from 'typeorm';
import  TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;

}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if ( type ==='outcome' && total < value ){
      throw new AppError(
        `Seu saldo é de R$:${total} FAÇA UM DEPÓSITO PARA CONTINUAR `,);
    }
//estou buscando com let, se a category ja existe
    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });
// se nao existir, criamos ela e armazenamos na let acima, apos é so trocar category: trasanctionCategory
    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    })
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
