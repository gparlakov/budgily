import { component$, useStylesScoped$ } from '@builder.io/qwik';

import styles from './movement-details.scss?inline';

export const MovementDetails = component$(() => {
  useStylesScoped$(styles);

  return <>MovementDetails works!</>;
});


// <rect
//               key={x.id}
//               {...x.coord}
//               onMouseEnter$={(e, i) => {
//                 (x as any).storedWidht = x.coord.width;
//                 x.coord.width = `${parseInt(x.coord.width) * 2}`;
//               }}
//               onMouseLeave$={() => (x.coord.width = (x as any).storedWidht)}
//               onClick$={() => {
//                 store.selectedMovementId = x.id;
//               }}
//             ></rect>

//             <div class="sizer"></div>
//       <div
//         class="hover"
//         style={{ display: store.showOver ? 'block' : 'none', top: store.positionY, left: store.positionX }}
//       >
//         {store.text}
//       </div>
//       {store.selectedMovementId != null ? (
//         <MovementDetails
//           movementId={store.selectedMovementId}
//           onClose$={() => {
//             store.selectedMovementId = undefined;
//             store.width += Math.random() > 0.5 ? Math.random() * 0.001 : -Math.random() * 0.001;
//           }}
//         />
//       ) : (
//         <></>
//       )}

