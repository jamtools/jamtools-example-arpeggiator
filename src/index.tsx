import React from 'react';

import springboard from 'springboard';

import '@jamtools/core/modules/macro_module/macro_module';

springboard.registerModule('Arpeggiator', {}, async (moduleAPI) => {
    const macroModule = moduleAPI.deps.module.moduleRegistry.getModule('macro');

    const musicalOutput = await macroModule.createMacro(moduleAPI, 'musicalOutput', 'musical_keyboard_output', {});

    let currentlyHeldDownNotes: number[] = [];

    setInterval(() => {
        const degrees = [0, 2, 4, 5, 7, 9, 11];

        for (const note of currentlyHeldDownNotes) {
            const index = Math.floor(Math.random() * degrees.length);
            const degree = degrees[index];
            musicalOutput.send({
                channel: 1,
                number: note + degree,
                type: 'noteon',
            });

            setTimeout(() => {
                musicalOutput.send({
                    channel: 1,
                    number: note + degree,
                    type: 'noteoff',
                });
            }, 50);
        }
    }, 100);

    const musicalInput = await macroModule.createMacro(moduleAPI, 'musicalInput', 'musical_keyboard_input', {
        onTrigger: midiEventFull => {
            if (midiEventFull.event.type === 'noteon') {
                if (currentlyHeldDownNotes.includes(midiEventFull.event.number)) {
                    return;
                }

                currentlyHeldDownNotes = [...currentlyHeldDownNotes, midiEventFull.event.number];
            } else if (midiEventFull.event.type === 'noteoff') {
                if (!currentlyHeldDownNotes.includes(midiEventFull.event.number)) {
                    return;
                }

                currentlyHeldDownNotes = currentlyHeldDownNotes.filter(note => note !== midiEventFull.event.number);
            }

            // musicalOutput.send(midiEventFull.event);
            // musicalOutput.send({
            //     ...midiEventFull.event,
            //     number: midiEventFull.event.number + 7,
            // });
            // musicalOutput.send({
            //     ...midiEventFull.event,
            //     number: midiEventFull.event.number + 4,
            // });
            // musicalOutput.send({
            //     ...midiEventFull.event,
            //     number: midiEventFull.event.number + 12,
            // });
        }
    });

    moduleAPI.registerRoute('', {hideNavbar: true}, () => {
        const boxStyle: React.CSSProperties = {border: '1px solid', padding: '20px', margin: '20px', width: '300px'};

        return (
            <div>
                <details>
                    <summary>
                        Macro configs
                    </summary>
                    <div style={boxStyle}>
                        Musical input
                        <musicalInput.components.edit/>
                    </div>
                    <div style={boxStyle}>
                        Musical output
                        <musicalOutput.components.edit/>
                    </div>
                </details>
            </div>
        );
    });
});
