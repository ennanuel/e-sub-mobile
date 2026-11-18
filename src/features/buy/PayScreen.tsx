'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Copy } from '@/components/icons';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import text from '@/components/ui/text.module.css';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/lib/api';
import { accountNumber, currencyFull, formatUnitSize } from '@/lib/format';
import { usePurchase } from '@/lib/purchase';
import { routes } from '@/lib/routes';
import { useSession } from '@/lib/session';
import styles from './PayScreen.module.css';
import { useQuery } from '@tanstack/react-query';
import { getEquityBankAccounts, makeBankPayment } from '@/api/equity';
import { ProjectDetails } from '@/types';
import { uploadFiles } from '@/api/store';
import { Center, Spinner } from '@chakra-ui/react';

/** Buying, step 5: the amount and LCR's accounts. "I've made the transfer" tells LCR to look for it. */
export function PayScreen({ listing, equityId: initialEquityId }: { listing: ProjectDetails; equityId: string }) {
  const [isRouting, setIsRouting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const slug = listing.id?.toString();
  const router = useRouter();
  const { user } = useSession();
  const toast = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { equityId, setEquityId, isLoadingEquity, equity } = usePurchase();

  const amountToPay = Number(equity?.payment_plan?.initial_deposit_in_value ?? equity?.offer_price);
  const currency = equity?.currency ?? null;
  const unitSize = formatUnitSize(equity?.unit ?? null);

  const { isLoading: isLoadingBankAccounts, data: bankAccounts = [] } = useQuery({
    queryKey: ['equity_bank_accounts', equityId, user?.id],
    queryFn: () =>
      getEquityBankAccounts(equityId?.toString() ?? '', {
        email: user?.email ?? '',
        user_id: user?.id?.toString() ?? '',
        is_fractional: equity?.type === 'FRACTIONAL',
      }),
  });

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = [];
    if (!event.target.files) return;
    for (let i = 0; i < event.target.files.length; i++) files.push(event.target.files[i]);
    submitReceipts(files);
  };

  useEffect(() => {
    if (!equityId?.toString() && !!initialEquityId && !isNaN(Number(initialEquityId))) {
      setEquityId(Number(initialEquityId));
    }
  }, [initialEquityId, equityId]);

  if (isLoadingEquity || !equity || !user)
    return (
      <Center width="100%" height="100dvh">
        <Spinner size="xl" />
      </Center>
    );

  const copy = async (n: string) => {
    try {
      await navigator.clipboard.writeText(n);
      toast.show('Account number copied');
      setCopied(n);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      toast.show(`Account number: ${n}`);
    }
  };

  const submitReceipts = async (files: File[]) => {
    setSending(true);
    setError('');
    try {
      const fileUrls = await uploadFiles(files);
      await makeBankPayment(equityId?.toString() ?? '', { equity_id: equityId?.toString() ?? '', receipt_urls: fileUrls });
      setIsRouting(true);
      router.push(routes.buy.thankYou(slug, equityId?.toString()));
    } catch (e) {
      setError(errorMessage(e, 'Could not reach LCR. Check your connection and try again.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen
      label="Pay to start"
      back={routes.buy.offer(slug, equityId?.toString())}
      title={
        <span className={text.kicker}>
          {listing.name} · {unitSize}
        </span>
      }
      footer={
        <>
          {error && <p className={text.footerError}>{error}</p>}
          <Button
            loading={sending || isRouting}
            loadingText="Letting LCR know"
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            I’ve made the transfer
          </Button>
          <Button
            variant="link"
            onClick={() => {
              router.push(routes.home(slug));
            }}
          >
            Go back to home page
          </Button>
        </>
      }
    >
      <input ref={inputRef} multiple type="file" accept="image/* applcation/pdf" style={{ display: 'none' }} onChange={handleFileChange} />
      <h1 className={text.heading}>
        {isLoadingBankAccounts
          ? 'Fetching Bank Accounts...'
          : bankAccounts?.length === 1
            ? 'Transfer to this'
            : 'Transfer to any of these.'}
      </h1>
      <div className={`label ${styles.amountLabel}`}>Amount to be paid</div>
      <div className={styles.amount}>{currencyFull(amountToPay, currency)}</div>

      <div className={styles.accountsHead}>
        <span className="label">Accounts</span>
        <span className={`label ${styles.muted}`}>{String(bankAccounts.length).padStart(2, '0')}</span>
      </div>
      {isLoadingBankAccounts ? (
        <Center width="100%" minHeight="320px">
          <Spinner size="lg" />
        </Center>
      ) : (
        <>
          {bankAccounts.map((account) => (
            <div key={account?.account_number} className={styles.account}>
              <span>
                <i>{account?.account_bank_name ?? account?.bank_name}</i>
                <b>{accountNumber(account?.account_number)}</b>
              </span>
              <button
                type="button"
                onClick={() => void copy(account?.account_number)}
                aria-label={`Copy ${account.account_bank_name ?? account?.bank_name} account number`}
              >
                <Copy size={14} />
                <span>{copied === account?.account_number ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          ))}
          <p className={text.smallPrint}>Account name: {bankAccounts?.[0]?.account_name}. We confirm it the moment it lands.</p>
          {toast.element}
        </>
      )}
    </Screen>
  );
}
