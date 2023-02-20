import {dialog} from "../dialog.js";

export let sccode = {
    code: '7813bf2ae9a0feecce41ee7dcba740b3',
    info: {
        init: firstUse
    }
}

function firstUse() {
    if (!Boolean(kernel.getProp('scCodeIntro'))) {
        dialog('csTimer+',
            '<div style="line-height: 26px;"><h4>Código Aplicado!</h4>\n' +
            '        <br><p>Oie, eu sou a Suzane Coelho. Muito obrigada por usar o meu código no csTimer+</p><p>Espero que você aproveite ainda mais o seu timer com as novidades que preparei para você!</p><br>\n' +
            '        <p>Veja e ajuste o que há de novo com o seu código:</p><br>\n' +
            '        <table class="table" style="margin: 0 auto">\n' +
            '            <tbody>\n' +
            '                <tr>\n' +
            '                    <th>Novidade</th>\n' +
            '                    <th>Configuração</th>\n' +
            '                </tr>\n' +
            '                <tr>\n' +
            '                    <td>Vozes exclusivas de Suzane Coelho</td>\n' +
            '                    <td>Habilitado</td>\n' +
            '                </tr>\n' +
            '                <tr>\n' +
            '                    <td>Tema exclusivo de Suzane Coelho</td>\n' +
            '                    <td>Adicionado à lista</td>\n' +
            '                </tr>\n' +
            '                <tr>\n' +
            '                    <td>Usar voz de Suzane Coelho por padrão</td>\n' +
            '                    <td><select name="scVoice"><option value="y" selected="">Sim</option><option value="n">Não</option></select></td>\n' +
            '                </tr>\n' +
            '            </tbody>\n' +
            '        </table>\n' +
            '        <p><small>Você não verá esta mensagem novamente.</small></p>\n' +
            '    </div>',
            function () {
                let scVoice = $('select[name=scVoice]').find('option:selected').val();
                if (scVoice == 'y') {
                    kernel.setProp('plusIns', 'sc');
                    kernel.setProp('voiceIns', 'n');
                }
                kernel.setProp('scCodeIntro', true);
            },
            function () {
                kernel.setProp('scCodeIntro', true);
            }
        );
    }
}