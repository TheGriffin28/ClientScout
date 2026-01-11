import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Support() {
  return (
    <>
      <PageMeta
        title="Support | ClientScout"
        description="Get help and support for ClientScout"
      />
      <PageBreadcrumb pageTitle="Support Center" />
      
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          {/* Contact Form */}
          <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Contact Support
              </h3>
            </div>
            <form action="#">
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Select subject"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Message
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Type your message"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  ></textarea>
                </div>

                <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          {/* FAQ / Info */}
          <div className="rounded-xl border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Contact Information
              </h3>
            </div>
            <div className="p-6.5">
              <div className="mb-4">
                <h4 className="mb-1 font-semibold text-black dark:text-white">Email</h4>
                <p className="text-sm text-gray-500">support@clientscout.com</p>
              </div>
              <div className="mb-4">
                <h4 className="mb-1 font-semibold text-black dark:text-white">Phone</h4>
                <p className="text-sm text-gray-500">+1 234 567 890</p>
              </div>
              <div>
                <h4 className="mb-1 font-semibold text-black dark:text-white">Address</h4>
                <p className="text-sm text-gray-500">123 Business St, Tech City, TC 90210</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
