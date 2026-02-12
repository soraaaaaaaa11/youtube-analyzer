export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        利用規約
      </h1>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <p>
            この利用規約（以下「本規約」）は、坂野宙輝（以下「当方」）が提供する
            YouTube分析ツール（以下「本サービス」）の利用条件を定めるものです。
            ユーザーの皆様には、本規約に同意いただいた上で、本サービスをご利用いただきます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第1条（適用）
          </h2>
          <p>
            本規約は、ユーザーと当方との間の本サービスの利用に関わる一切の関係に適用されます。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第2条（利用登録）
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              本サービスの利用を希望する方は、本規約に同意の上、当方の定める方法によって
              利用登録を申請するものとします。
            </li>
            <li>
              当方は、以下の場合に利用登録を拒否することがあります。
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>虚偽の事項を届け出た場合</li>
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>その他、当方が利用登録を相当でないと判断した場合</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第3条（アカウント管理）
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              ユーザーは、自己の責任において、本サービスのアカウント情報を適切に管理するものとします。
            </li>
            <li>
              ユーザーは、いかなる場合にも、アカウントを第三者に譲渡または貸与することはできません。
            </li>
            <li>
              アカウント情報が第三者に使用されたことによって生じた損害は、
              当方に故意または重大な過失がある場合を除き、当方は一切の責任を負いません。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第4条（料金および支払方法）
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              ユーザーは、本サービスの有料部分の対価として、当方が別途定める料金を支払うものとします。
            </li>
            <li>
              支払方法はクレジットカード決済とし、毎月自動的に課金されます。
            </li>
            <li>
              ユーザーが料金の支払を遅滞した場合、当方はサービスの提供を停止することができます。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第5条（禁止事項）
          </h2>
          <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>不正アクセスをし、またはこれを試みる行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>本サービスで得た情報を無断で商用利用する行為</li>
            <li>当方のサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
            <li>自動化ツール（スクレイピング等）による大量アクセス</li>
            <li>その他、当方が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第6条（本サービスの提供の停止等）
          </h2>
          <p>
            当方は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく
            本サービスの全部または一部の提供を停止または中断することができます。
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>本サービスにかかるシステムの保守点検または更新を行う場合</li>
            <li>地震、落雷、火災等の不可抗力により本サービスの提供が困難となった場合</li>
            <li>その他、当方が本サービスの提供が困難と判断した場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第7条（退会）
          </h2>
          <p>
            ユーザーは、当方の定める手続により、いつでも本サービスから退会することができます。
            退会後は、有料プランの残り期間があっても返金は行いません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第8条（免責事項）
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              当方は、本サービスに事実上または法律上の瑕疵がないことを明示的にも黙示的にも保証しません。
            </li>
            <li>
              本サービスで提供する情報（YouTubeチャンネルのデータ等）の正確性、完全性、
              有用性について、当方は保証しません。
            </li>
            <li>
              本サービスの利用に起因してユーザーに生じたあらゆる損害について、
              当方に故意または重大な過失がある場合を除き、当方は一切の責任を負いません。
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第9条（サービス内容の変更等）
          </h2>
          <p>
            当方は、ユーザーに通知することなく、本サービスの内容を変更したり、
            本サービスの提供を中止することができるものとし、
            これによってユーザーに生じた損害について一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第10条（利用規約の変更）
          </h2>
          <p>
            当方は、必要と判断した場合には、ユーザーに通知することなく本規約を変更することができます。
            変更後の利用規約は、本サービス上に掲示した時点から効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            第11条（準拠法・裁判管轄）
          </h2>
          <p>
            本規約の解釈にあたっては、日本法を準拠法とします。
            本サービスに関して紛争が生じた場合には、名古屋地方裁判所を専属的合意管轄とします。
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm text-gray-500 dark:text-gray-400">
        制定日: 2026年2月12日
      </p>
    </div>
  );
}
