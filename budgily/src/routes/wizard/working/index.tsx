import {
    component$,
    createContextId,
    useContextProvider,
    useContext,
    Slot,
  } from '@builder.io/qwik';

  const CtxId = createContextId<string>('test');

  export default component$(() => {
    useContextProvider(CtxId, 'test');

    return (
      <>
        <Wizard steps={4} current={3}>
          <Title q:slot="step0"> Title 1</Title>
          <Step q:slot="step0"> Step 1 ssss</Step>

          <Title q:slot="step1"> Title 2</Title>
          <Step q:slot="step1"> Step 2</Step>

          <Step q:slot="step2"> Step 3</Step>

          <Step q:slot="step3"> Step 4</Step>
        </Wizard>
      </>
    );
  });

  export const Wizard = component$(
    ({ steps, current }: { steps: number; current: number }) => {
      const ix = Array.from({ length: steps }).map((_, i) => i);

      console.log(
        '---render',
        current,
        ix.filter((i) => i === current)
      );
      return (
        <>
          {ix
            .filter((i) => i === current)
            .map((i) => (
              <Slot name={`step${i}`} />
            ))}
        </>
      );
    }
  );

  export const Step = component$(() => {
    const ctx = useContext(CtxId);
    return (
      <>
        {ctx}
        <Slot />
      </>
    );
  });

  export const Title = component$(() => {
    const ctx = useContext(CtxId);
    return (
      <>
        {ctx}
        <Slot />
      </>
    );
  });


