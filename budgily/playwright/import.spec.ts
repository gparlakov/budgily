import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/import');
  await expect(page.getByRole('heading', {name:'Select file'})).toBeVisible();

  await page.getByPlaceholder('Input from a file').setInputFiles({ name: 'report.xml', mimeType: 'text/xml', buffer: movementsXml() });
  await page.getByPlaceholder('Input from a file').click()
});

const movementsXml = () => {
  return Buffer.from(`<AccountMovements xmlns:d="http://schemas.datacontract.org/2004/07/DAIS.eBank.Client.WEB.mvc.Accounts.Models" xmlns:d1="http://schemas.datacontract.org/2004/07/DAIS.eBank.Client.WEB.mvc.Accounts.Models">
  <AccountMovement>
    <ValueDate>31.12.2022</ValueDate>
    <Reason>516849xxxxxx0103  ОПЕРАЦИЯ НА ПОС 31.12.2022 17:04<br/>Авт. код: B70455</Reason>
    <OppositeSideName></OppositeSideName>
    <OppositeSideAccount></OppositeSideAccount>
    <MovementType>Debit</MovementType>
    <Amount>87,69</Amount>
  </AccountMovement>
  <AccountMovement>
    <ValueDate>31.12.2022</ValueDate>
    <Reason>АВТ. МЕС. ТАКСА УСЛУГИ (SVC)</Reason>
    <OppositeSideName></OppositeSideName>
    <OppositeSideAccount></OppositeSideAccount>
    <MovementType>Debit</MovementType>
    <Amount>2,40</Amount>
  </AccountMovement>
  <AccountMovement>
    <ValueDate>31.12.2022</ValueDate>
    <Reason>ТАКСА ПАКЕТНО ОБСЛУЖВАНЕ</Reason>
    <OppositeSideName></OppositeSideName>
    <OppositeSideAccount>7291076521029999</OppositeSideAccount>
    <MovementType>Debit</MovementType>
    <Amount>4,95</Amount>
  </AccountMovement>
</AccountMovements>`);
};
